import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Filters
    const country = searchParams.get('country')
    const location = searchParams.get('location')
    const type = searchParams.get('type')
    const experienceLevel = searchParams.get('experience_level')
    const remote = searchParams.get('remote')
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('posted_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (country) {
      query = query.ilike('country', `%${country}%`)
    }

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (experienceLevel) {
      query = query.eq('experience_level', experienceLevel)
    }

    if (remote !== null) {
      query = query.eq('remote', remote === 'true')
    }

    if (category) {
      query = query.ilike('category', `%${category}%`)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,company_name.ilike.%${search}%`)
    }

    const { data: jobs, error, count } = await query

    if (error) {
      console.error('Error fetching jobs:', error)
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }

    return NextResponse.json({
      jobs: jobs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in jobs API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('jobs')
      .insert(body)
      .select()
      .single()

    if (error) {
      console.error('Error creating job:', error)
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in jobs POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
